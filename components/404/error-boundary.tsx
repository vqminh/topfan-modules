import React, { ErrorInfo } from "react";
import { reportError } from "../../utils/logging";
import ErrorInformation from "./error-information";

export class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    await reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorInformation />;
    }

    return <>{this.props.children}</>;
  }

  clearState() {
    this.setState({ hasError: false });
  }
}
