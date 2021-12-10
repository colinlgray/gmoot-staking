import { FC } from "react";
import { ErrorBoundary } from "react-error-boundary";

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error?.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

const errorHandler = (error: Error, info: { componentStack: string }) => {
  console.error("error", error);
  console.error("info", info);
  // Do something with the error
  // E.g. log to an error logging client here
};

export const ErrorBoundaryWrapper: FC = (props) => {
  return (
    <ErrorBoundary
      onError={errorHandler}
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // reset the state of your app so the error doesn't happen again
      }}
    >
      {props.children}
    </ErrorBoundary>
  );
};
