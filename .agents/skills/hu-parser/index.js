// Simulación de skill para pruebas
module.exports = {
  execute: async (input) => {
    return {
      skill: 'hu-parser',
      result: 'HU parseada correctamente',
      input: input.hu || input
    };
  }
};