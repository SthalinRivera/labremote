// app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      // Color primario (celeste/azul cielo)
      primary: 'sky',      // Opciones: 'sky', 'blue', 'cyan', 'teal'
      neutral: 'slate',    // Opciones: 'slate', 'gray', 'zinc', 'neutral'

      // También puedes usar colores personalizados
      // primary: 'custom-blue',
    },

    // Configuración global de componentes
    button: {
      default: {
        size: 'md',
        color: 'primary',
        variant: 'solid'
      }
    },

    card: {
      default: {
        size: 'sm',
        variant: 'subtle'
      }
    },

    input: {
      default: {
        size: 'md',
        color: 'primary'
      }
    }
  }
})