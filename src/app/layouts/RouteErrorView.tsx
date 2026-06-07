import { useRouteError } from 'react-router-dom';

export function RouteErrorView() {
  const error = useRouteError();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050b12] px-6 text-slate-100">
      <div className="max-w-2xl rounded-3xl border border-slate-800 bg-[#08111e] p-10 shadow-2xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-slate-100">Route failed to load</h1>
        <p className="mt-4 text-slate-400">An error happened while rendering this screen.</p>
        <pre className="mt-6 whitespace-pre-wrap rounded-2xl bg-slate-950/80 p-4 text-sm text-rose-200">
          {String(error)}
        </pre>
      </div>
    </div>
  );
}
