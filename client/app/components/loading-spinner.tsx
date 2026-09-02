function LoadingSpinner({
  spinnerIconClasses,
}: {
  spinnerIconClasses?: string;
}) {
  return (
    <div className="loading-spinner">
      <section>
        <h3>
          <i className={spinnerIconClasses} />
        </h3>
      </section>
    </div>
  );
}

export default LoadingSpinner;
