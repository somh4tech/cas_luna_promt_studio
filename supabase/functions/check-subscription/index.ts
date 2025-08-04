import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("User not authenticated");
    
    const user = userData.user;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing subscription in our database
    const { data: existingSub } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // Get customer from Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      // No Stripe customer, ensure user is on free plan
      return new Response(JSON.stringify({
        subscribed: false,
        plan: "free",
        status: "active"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    
    // Get active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // No active subscription, user should be on free plan
      if (existingSub) {
        // Update existing subscription to inactive
        await supabaseClient
          .from("user_subscriptions")
          .update({ status: "inactive" })
          .eq("id", existingSub.id);
      }
      
      return new Response(JSON.stringify({
        subscribed: false,
        plan: "free",
        status: "active"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    // Determine plan based on price
    let planName = "free";
    const priceAmount = subscription.items.data[0].price.unit_amount || 0;
    
    if (priceAmount === 1900) planName = "starter";
    else if (priceAmount === 4900) planName = "team";
    else if (priceAmount === 19900) planName = "enterprise";

    // Update or create subscription record
    const subscriptionData = {
      user_id: user.id,
      plan_name: planName,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: "active",
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    };

    if (existingSub) {
      await supabaseClient
        .from("user_subscriptions")
        .update(subscriptionData)
        .eq("id", existingSub.id);
    } else {
      await supabaseClient
        .from("user_subscriptions")
        .insert(subscriptionData);
    }

    return new Response(JSON.stringify({
      subscribed: true,
      plan: planName,
      status: "active",
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Subscription check error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      subscribed: false,
      plan: "free",
      status: "active"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Don't fail hard, default to free plan
    });
  }
});