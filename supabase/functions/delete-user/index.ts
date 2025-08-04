
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      console.error('Delete user: No userId provided');
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Delete user: Starting deletion process for userId:', userId);

    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // First, delete from user_roles table
    console.log('Delete user: Deleting user roles');
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (roleError) {
      console.error('Delete user: Error deleting user roles:', roleError);
      throw new Error(`Failed to delete user roles: ${roleError.message}`);
    }

    // Delete from profiles table
    console.log('Delete user: Deleting user profile');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Delete user: Error deleting user profile:', profileError);
      throw new Error(`Failed to delete user profile: ${profileError.message}`);
    }

    // Finally, delete from auth.users using admin client
    console.log('Delete user: Deleting from auth system');
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Delete user: Error deleting from auth system:', authError);
      throw new Error(`Failed to delete user from auth system: ${authError.message}`);
    }

    console.log('Delete user: Successfully deleted user:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Delete user: Exception occurred:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred while deleting the user'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
