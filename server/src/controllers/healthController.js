export function getHealth(_request, response) {
  response.json({
    success: true,
    message: 'Resource Booking API is running'
  });
}
