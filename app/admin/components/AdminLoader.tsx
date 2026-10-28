interface AdminLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export default function AdminLoader({ label = 'Loading', fullScreen = false }: AdminLoaderProps) {
  return (
    <div className={`adm-loader${fullScreen ? ' is-fullscreen' : ''}`} role="status" aria-live="polite">
      <div className="adm-loader-mark" aria-hidden="true">
        <span />
        <span />
        <i />
      </div>
      <div className="adm-loader-copy">
        <strong>{label}</strong>
        <span>Please wait a moment</span>
      </div>
    </div>
  );
}
