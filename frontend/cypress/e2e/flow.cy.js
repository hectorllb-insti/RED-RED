describe('Flujo de Usuario No Autenticado', () => {
  it('Debe redirigir a /login cuando se accede a una ruta protegida', () => {
    // 1. Visitar la página de inicio (protegida)
    cy.visit('/')

    // 2. Verificar redirección automática al login
    cy.url().should('include', '/login')

    // 3. Verificar que el formulario de login es visible
    // Usamos el texto del h2 que vimos en Login.js
    cy.get('h2').should('contain', 'Bienvenido a RED-RED')
    
    // 4. Verificar campos del formulario
    // React Hook Form añade el atributo name a los inputs
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
    
    // 5. Probar interactividad básica
    cy.get('input[name="email"]').type('test@example.com').should('have.value', 'test@example.com')
    cy.get('input[name="password"]').type('password123').should('have.value', 'password123')
    
    // 6. Verificar enlace a registro
    cy.get('a[href="/register"]').should('be.visible').and('contain', 'Regístrate aquí')
  })

  it('Debe mostrar errores de validación en el login', () => {
    cy.visit('/login')
    
    // Intentar enviar formulario vacío
    cy.get('button[type="submit"]').click()
    
    // Verificar que aparecen mensajes de error definidos en Login.js
    cy.contains('El correo es requerido').should('be.visible')
    cy.contains('La contraseña es requerida').should('be.visible')
  })
})
