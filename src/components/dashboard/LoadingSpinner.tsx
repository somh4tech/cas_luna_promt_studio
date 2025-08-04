
interface LoadingSpinnerProps {
  message: string;
  isRetry?: boolean;
}

const LoadingSpinner = ({ message, isRetry = false }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <span className="text-gray-600">{message}</span>
      {isRetry && (
        <span className="text-gray-500 text-sm mt-2">Attempting to reconnect...</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
