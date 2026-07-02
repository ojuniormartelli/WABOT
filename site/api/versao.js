module.exports = (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'WaBot',
    description: 'Atendente Inteligente para WhatsApp',
    downloadUrl: 'https://github.com/ojuniormartelli/WABOT/releases/latest',
    changelog: [
      '- Primeira versão pública do WaBot',
      '- Sistema de aprendizado contínuo',
      '- Detecção automática de saudações e agradecimentos',
      '- Painel de gerenciamento via navegador',
    ],
    releaseDate: '2026-07-02',
  });
};
