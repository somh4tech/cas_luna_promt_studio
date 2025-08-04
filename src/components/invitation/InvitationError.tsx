
interface InvitationErrorProps {
  error: string;
  errorType: string | null;
  userEmail: string | null;
  invitationEmail: string | null;
}

const InvitationError = ({ error, errorType, userEmail, invitationEmail }: InvitationErrorProps) => {
  const isEmailMismatch = errorType === 'email_mismatch';

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <p className="text-sm text-red-800 font-medium mb-2">Error Details:</p>
      <p className="text-sm text-red-700">{error}</p>
      
      {isEmailMismatch && userEmail && invitationEmail && (
        <div className="mt-3 p-2 bg-red-100 rounded text-xs">
          <p><strong>Your account:</strong> {userEmail}</p>
          <p><strong>Invitation sent to:</strong> {invitationEmail}</p>
        </div>
      )}
    </div>
  );
};

export default InvitationError;
