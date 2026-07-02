module.exports = (req, res) => {
  res.json({
    version: '1.0.1',
    name: 'WaBot',
    description: 'Atendente Inteligente para WhatsApp',
    downloadUrl: 'https://github.com/ojuniormartelli/WABOT/releases/latest',
    changelog: [
      '- Instalador .exe automático via GitHub Actions',
      '- Scripts install.sh, start.sh e stop.sh para macOS/Linux',
      '- Correção das URLs do repositório na landing page',
    ],
    releaseDate: '2026-07-02',
  });
};
