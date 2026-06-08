interface ErrorScreenProps {
  message: string
}

const ErrorScreen = ({ message }: ErrorScreenProps) => {
  return (
    <div className="min-h-dvh grid place-items-center px-6">
      <div
        className="max-w-md w-full rounded-2xl border p-8 text-center"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}>
        <div
          className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full text-xl font-bold"
          style={{ background: 'var(--accent-soft)', color: 'var(--danger)' }}>
          !
        </div>
        <h1 className="font-display text-2xl font-bold">
          Données indisponibles
        </h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          {message}
        </p>
        <p className="mt-6 text-xs" style={{ color: 'var(--text-faint)' }}>
          Vérifiez le fichier teams-2026.json puis rechargez la page.
        </p>
      </div>
    </div>
  )
}

export default ErrorScreen
