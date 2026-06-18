using Microsoft.AspNetCore.Mvc;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Services;

namespace PlaceGuide.Server.Controllers
{
    [Route("api/audio-passes")]
    [ApiController]
    public class AudioPassesController : ControllerBase
    {
        private readonly IGuestAudioPassService _guestAudioPassService;

        public AudioPassesController(IGuestAudioPassService guestAudioPassService)
        {
            _guestAudioPassService = guestAudioPassService;
        }

        [HttpPost("mock-purchase")]
        public ActionResult<CreateGuestAudioPassResponseDto> CreateMockPurchase()
        {
            var issuedPass = _guestAudioPassService.IssueDayPass();

            return Ok(new CreateGuestAudioPassResponseDto
            {
                Token = issuedPass.Token,
                PlanCode = issuedPass.Pass.PlanCode,
                PlanName = "1-Day Audio Guide Pass",
                ExpiresAtUtc = issuedPass.Pass.ExpiresAtUtc,
                Message = "Gói nghe thử 24 giờ đã được kích hoạt."
            });
        }
    }
}
