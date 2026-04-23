// Simulación de skill para pruebas
module.exports = {
  execute: async (input) => {
    return {
      skill: 'qa-validator',
      result: 'Validación QA completada',
      errors: [],
      warnings: ['Falta validación de email']
    };
  }
};