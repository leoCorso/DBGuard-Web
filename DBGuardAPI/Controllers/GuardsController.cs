using DBGuardAPI.Data.StaticData;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DBGuardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = RoleNames.User)]
    public class GuardsController: ControllerBase
    {
        public GuardsController()
        {

        }

    }
}
