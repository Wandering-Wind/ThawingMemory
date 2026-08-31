function HomePage() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a href="/" aria-label="Thawing Memory home">
          Thawing Memory
        </a>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <p>Kitchen Memory Reconstruction Prototype</p>
          <h1 id="landing-title">Thawing Memory</h1>
        </section>

        <section className="landing-introduction" aria-labelledby="about-title">
          <h2 id="about-title">About this project</h2>
        </section>

        <section className="landing-entry" aria-label="Enter the prototype">
          <button type="button" disabled>
            Enter the Kitchen
          </button>
        </section>
      </main>

      <footer className="site-footer">
        <p>Thawing Memory prototype</p>
      </footer>
    </div>
  )
}

export default HomePage
