
export const setRedirectAfterAuth = (redirectTo: string, invitationToken?: string) => {
  console.log('AuthStorage: Setting redirect to:', redirectTo);
  localStorage.setItem('review_redirect_after_auth', redirectTo);
  
  if (invitationToken) {
    console.log('AuthStorage: Setting invitation token:', invitationToken);
    localStorage.setItem('review_invitation_token', invitationToken);
  }
};

export const getRedirectAfterAuth = (): string | null => {
  const redirect = localStorage.getItem('review_redirect_after_auth');
  console.log('AuthStorage: Getting redirect:', redirect);
  return redirect;
};

export const getInvitationToken = (): string | null => {
  const token = localStorage.getItem('review_invitation_token');
  console.log('AuthStorage: Getting invitation token:', token);
  return token;
};

export const clearRedirectAfterAuth = () => {
  console.log('AuthStorage: Clearing redirect and invitation token');
  localStorage.removeItem('review_redirect_after_auth');
  localStorage.removeItem('review_invitation_token');
};

export const handlePostAuthRedirect = (mounted: boolean) => {
  if (!mounted) return;
  
  const redirectUrl = getRedirectAfterAuth();
  const invitationToken = getInvitationToken();
  
  console.log('AuthStorage: Handling post-auth redirect:', { redirectUrl, invitationToken });
  
  if (redirectUrl && invitationToken) {
    // Clear the stored values
    clearRedirectAfterAuth();
    
    // Redirect to the stored URL
    setTimeout(() => {
      if (mounted) {
        window.location.href = redirectUrl;
      }
    }, 100);
  }
};
