import { execSync } from "child_process";

export async function POST(req) {
  try {
    const { action, service } = await req.json();

    const services = {
      "wabot-backend": { cwd: "C:\\WaBot V2", cmd: "npm start" },
      "wabot-dashboard": { cwd: "C:\\WaBot Dashboard", cmd: "npm run dev" },
    };

    if (service === "evolution-api") {
      if (action === "logs") {
        const logs = execSync(`docker logs --tail 50 wabot-evolution 2>&1`)
          .toString();
        return Response.json({ success: true, logs });
      }
      const dockerActions = {
        start: "docker start wabot-evolution",
        stop: "docker stop wabot-evolution",
        restart: "docker restart wabot-evolution",
      };
      if (!dockerActions[action]) {
        return Response.json(
          { success: false, error: "Ação inválida" },
          { status: 400 }
        );
      }
      execSync(dockerActions[action]);
      const status = execSync(
        `docker inspect wabot-evolution --format='{{.State.Status}}'`
      )
        .toString()
        .trim();
      return Response.json({ success: true, status });
    }

    const svc = services[service];
    if (!svc) {
      return Response.json(
        { success: false, error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    if (action === "start") {
      execSync(
        `pm2 start npm --name "${service}" -- start`,
        svc.cwd ? { cwd: svc.cwd } : {}
      );
    } else if (action === "stop") {
      execSync(`pm2 stop "${service}"`);
    } else if (action === "restart") {
      execSync(`pm2 restart "${service}"`);
    } else if (action === "logs") {
      const logs = execSync(`pm2 logs "${service}" --nostream --lines 50 2>&1`)
        .toString();
      return Response.json({ success: true, logs });
    }

    const status = execSync(`pm2 show "${service}" --no-color 2>&1 | findstr status`).toString().trim();
    return Response.json({ success: true, status });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const pm2List = execSync(`pm2 jlist 2>&1`).toString();
    const processes = JSON.parse(pm2List).map((p) => ({
      name: p.name,
      status: p.pm2_env.status,
      pid: p.pid,
      uptime: p.pm2_env.pm_uptime,
    }));

    let dockerStatus = "stopped";
    try {
      dockerStatus = execSync(
        `docker inspect wabot-evolution --format='{{.State.Status}}' 2>&1`
      )
        .toString()
        .trim();
    } catch (_) {}

    return Response.json({
      success: true,
      processes: [
        ...processes,
        { name: "evolution-api", status: dockerStatus },
      ],
    });
  } catch (error) {
    return Response.json({ success: true, processes: [] });
  }
}
