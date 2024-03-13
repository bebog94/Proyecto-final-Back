async function modifyRole(userId) {
    try {
      const response = await fetch(`/api/users/premium/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        try {
          const errorBody = await response.json();
          console.error('Error al modificar el rol:', errorBody.message);
          alert(errorBody.message);
        } catch (parseError) {

          console.error('Error al modificar el rol:', response.statusText);
        }
      } else {
        console.log('Rol modificado con éxito');
      }
    } catch (error) {
      console.error('Error al modificar el rol:', error.message);
    }
  }

  async function deleteUser(userId) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        console.log('Usuario eliminado con éxito');
      } else {
        console.error('Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  }