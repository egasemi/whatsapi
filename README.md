# WhatsApp API con `whatsapp-web.js`

Este proyecto es una API para enviar mensajes de WhatsApp utilizando `whatsapp-web.js`.

## Configuración

1. Clonar el repositorio.
2. Instalar las dependencias:
    ```
    npm install
    ```
3. Crear un archivo `.env` basado en el archivo de ejemplo.
4. Iniciar el servidor:
    ```
    npm start
    ```

## Uso

- Enviar un mensaje:
    - Endpoint: `/api/messages/send`
    - Método: `POST`
    - Body:
      ```json
      {
          "number": "Número de WhatsApp",
          "message": "Mensaje a enviar"
      }
      ```
