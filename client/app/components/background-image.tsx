function BackgroundImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="background-image fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat pointer-events-none">
      <img src={src} alt={alt} />
    </div>
  );
}

export default BackgroundImage;
