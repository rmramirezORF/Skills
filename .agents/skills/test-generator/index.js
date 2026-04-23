// Simulación de skill para pruebas
module.exports = {
  execute: async (input) => {
    return {
      skill: 'test-generator',
      result: 'Tests generados',
      tests: ['test_user_registration.js', 'test_login_flow.js']
    };
  }
};