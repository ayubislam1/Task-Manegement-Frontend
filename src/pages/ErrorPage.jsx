import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
	const error = useRouteError();

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
			<div className="text-center space-y-6">
				<h1 className="text-6xl font-bold text-primary">Oops!</h1>
				<p className="text-xl text-gray-600 dark:text-gray-400">
					Sorry, an unexpected error has occurred.
				</p>
				<p className="text-gray-500 dark:text-gray-500">
					{error.statusText || error.message}
				</p>
				<div className="mt-8">
					<Link
						to="/"
						className="px-6 py-3 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
					>
						Go Back Home
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ErrorPage;
