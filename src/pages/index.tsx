export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>ML/AMZ Pricer – API Starter</h1>
      <p>Usa las rutas API:</p>
      <ul>
        <li>POST /api/jobs</li>
        <li>GET /api/jobs/[id]</li>
        <li>GET /api/jobs/[id]/results.xlsx</li>
      </ul>
    </main>
  );
}
