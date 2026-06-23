using Microsoft.AspNetCore.Mvc;

namespace PlaceGuide.Server.Controllers
{
    [ApiController]
    [Route("api/webhook")] // Đỉnh của Controller là api/webhook
    public class PayOSWebhookController : ControllerBase
    {
        // Khi gộp cái đuôi "payos" này với cái Route ở trên, 
        // nó sẽ TỰ ĐỘNG TẠO RA cái link: api/webhook/payos cho mày!
        [HttpPost("payos")]
        public IActionResult HandlePayOSNotification([FromBody] object data)
        {
            // Trạm cuối hứng dữ liệu từ PayOS bắn về nằm ở đây nè mày!
            return Ok(new { message = "Tao đã nhận được tín hiệu của PayOS rồi nhé!" });
        }
    }
}