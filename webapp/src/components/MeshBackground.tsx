// Fixed, blurred gradient-blob background rendered once behind the whole app
// so the frosted-glass sidebar/topbar have something to show through.
// Purely decorative — respects prefers-reduced-transparency via CSS (index.css).
const MeshBackground = () => (
  <div className="mesh-bg" aria-hidden="true">
    <div className="mesh-blob mesh-blob-1" />
    <div className="mesh-blob mesh-blob-2" />
    <div className="mesh-blob mesh-blob-3" />
    <div className="mesh-noise" />
  </div>
);

export default MeshBackground;
