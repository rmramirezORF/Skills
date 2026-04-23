// Simulación de skill para pruebas
module.exports = {
  execute: async (input) => {
    return {
      skill: 'db-analyzer',
      result: 'Análisis de BD completado',
      tables: ['users', 'sessions']
    };
  }
};