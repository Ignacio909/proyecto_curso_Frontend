// Composable temporal para simular autenticación
// TODO: Reemplazar con el sistema de autenticación real cuando esté implementado

export const useAuth = () => {
  // TEMPORAL: Usuario simulado para desarrollo
  // Cuando implementen el login, esto vendrá de la sesión real
  const currentUser = ref({
    id: '123e4567-e89b-12d3-a456-426614174000',
    rol: 'admin', // Cambiar a 'admin', 'paciente', o 'especialista' para probar
    usuario: 'juan_perez',
    correo: 'juan@example.com',
    imagen: null,
    // Datos específicos según rol:
    telefono: '77123456', // Solo para paciente
    carnetIdentidad: '9876543', // Solo para paciente
    especialidad: 'Psicología' // Solo para especialista
  })

  const isAdmin = computed(() => currentUser.value?.rol === 'admin')
  const isPaciente = computed(() => currentUser.value?.rol === 'paciente')
  const isEspecialista = computed(() => currentUser.value?.rol === 'especialista')

  return {
    currentUser,
    isAdmin,
    isPaciente,
    isEspecialista
  }
}
