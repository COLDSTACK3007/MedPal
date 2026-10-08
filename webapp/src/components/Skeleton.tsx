const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-border-subtle rounded-lg ${className}`} aria-hidden="true" />
);

export default Skeleton;
