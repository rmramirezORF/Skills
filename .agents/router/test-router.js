// test-router.js
// Ejemplo de uso del router

const SkillRouter = require('./router');

async function testRouter() {
  const router = new SkillRouter();

  // Ejemplos de inputs para probar
  const testInputs = [
    "Como usuario quiero poder registrar un nuevo usuario en el sistema",
    "Necesito validar que la funcionalidad de login funcione correctamente",
    "Verificar cobertura de pruebas para la HU-123",
    "Análisis de base de datos para el módulo de usuarios",
    "Implementar seguridad en la API de autenticación"
  ];

  for (const input of testInputs) {
    console.log(`\n=== Probando input: "${input}" ===`);

    try {
      const result = await router.processUserQuery(input);
      console.log(`Tema: ${result.theme}`);
      console.log(`Confianza: ${result.context?.confidence || 'N/A'}`);
      console.log(`Estado: ${result.status}`);
      if (result.summary) {
        console.log(`Cobertura: ${result.summary.coverage}%`);
        console.log(`Errores: ${result.summary.errors.length}`);
        console.log(`Sugerencias: ${result.summary.suggestions.length}`);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testRouter().catch(console.error);
}

module.exports = testRouter;