// controllers/StudentTeamController.js
import db from '../../DB/db.config.js';

class StudentTeamController {

    // GET /api/teams/my-teams
    static async myTeams(req, res) {
        try {
            const userId = req.user?.user_id;
            if (!userId) return res.status(400).json({ message: 'Missing user id' });

            const teams = await db.team.findMany({
                where: { teammember: { some: { user_id: Number(userId) } } },
                include: {
                    domain: true,
                    created_by_user: { select: { user_id: true, name: true, email: true } },
                    teammember: {
                        select: {
                            user_id: true,
                            role_in_team: true,
                            user: { select: { user_id: true, name: true, email: true } },
                        },
                    },
                    _count: { select: { teammember: true } },
                },
                orderBy: { created_at: 'desc' },
            });

            return res.status(200).json({ data: teams });
        } catch (err) {
            console.error('myTeams error:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

    // GET /api/teams/:id
    static async getTeamById(req, res) {
        try {
            const teamId = Number(req.params.id);
            if (!teamId) return res.status(400).json({ message: "Invalid team ID" });

            const team = await db.team.findUnique({
                where: { team_id: teamId },
                include: {
                    domain: true,
                    created_by_user: { select: { user_id: true, name: true, email: true } },
                    teammember: {
                        select: {
                            role_in_team: true,
                            user: { select: { user_id: true, name: true, email: true } },
                        },
                    },
                    proposal: {
                        select: {
                            proposal_id: true,
                            title: true,
                            pdf_path: true,
                            created_at: true,
                            file_size: true,
                        },
                        orderBy: { created_at: 'desc' },
                    },
                    teamcomment: {
                        select: {
                            comment_id: true,
                            comment: true,
                            created_at: true,
                            user: { select: { user_id: true, name: true } },
                        },
                        orderBy: { created_at: 'desc' },
                    },
                    _count: { select: { teammember: true } },
                },
            });

            if (!team) return res.status(404).json({ message: "Team not found" });

            return res.status(200).json({ data: team });
        } catch (error) {
            console.error("Error fetching team details:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/student/my-teams/papers
    static async getAllTeamPapers(req, res) {
        try {
            const userId = req.user?.user_id;
            if (!userId) return res.status(400).json({ message: "Missing user id" });

            const papers = await db.paper.findMany({
                where: {
                    team: { teammember: { some: { user_id: Number(userId) } } },
                },
                select: {
                    paper_id: true,
                    title: true,
                    pdf_path: true,
                    created_at: true,
                    file_size: true,
                    status: true,                   // PENDING | UNDER_REVIEW | COMPLETED
                    aggregated_decision: true,      // ACCEPT | REJECT | MINOR_REVISIONS | MAJOR_REVISIONS | null
                    aggregated_decided_at: true,
                    team: {
                        select: {
                            team_id: true,
                            team_name: true,
                            domain: { select: { domain_name: true } },
                        },
                    },
                    teacher: {
                        select: {
                            teacher_id: true,
                            user: { select: { name: true, email: true } },
                        },
                    },
                },
                orderBy: { created_at: "desc" },
            });

            const base = process.env.APP_URL || "http://localhost:8000";
            const data = papers.map((p) => ({
                ...p,
                download_url: p.pdf_path ? `${base}/${p.pdf_path}` : null,
            }));

            return res.status(200).json({ data });
        } catch (error) {
            console.error("Error fetching team papers:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    static async getAllTeamProposals(req, res) {
        try {
            const userId = Number(req.user?.user_id ?? req.user?.id);
            if (!userId) return res.status(400).json({ message: "Missing user id" });

            const teacher = await db.teacher.findFirst({
                where: { user_id: userId },
                select: { teacher_id: true },
            });

            const orClause = [
                { team: { teammember: { some: { user_id: userId } } } },
                { team: { created_by_user_id: userId } },
            ];
            if (teacher) orClause.push({ submitted_by: teacher.teacher_id });

            const proposals = await db.proposal.findMany({
                where: { OR: orClause },
                select: {
                    proposal_id: true,
                    title: true,
                    pdf_path: true,
                    created_at: true,
                    file_size: true,
                    status: true,
                    aggregated_decision: true,
                    aggregated_decided_at: true,
                    team: {
                        select: {
                            team_id: true,
                            team_name: true,
                            domain: { select: { domain_name: true } },
                        },
                    },
                    teacher: {
                        select: {
                            teacher_id: true,
                            user: { select: { name: true, email: true } },
                        },
                    },
                },
                orderBy: { created_at: "desc" },
            });

            const base = process.env.APP_URL || "http://localhost:8000";
            const data = proposals.map((p) => ({
                ...p,
                download_url: p.pdf_path ? `${base}/${p.pdf_path}` : null,
            }));

            return res.status(200).json({ data });
        } catch (error) {
            console.error("Error fetching team proposals:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }


    // GET /api/student/my-teams/comments
    static async getAllTeamComments(req, res) {
        try {
            const userId = Number(req.user?.user_id ?? req.user?.id);
            if (!userId) return res.status(400).json({ message: "Missing user id" });

            const comments = await db.teamcomment.findMany({
                where: {
                    team: { teammember: { some: { user_id: userId } } },
                },
                include: {
                    user: { select: { user_id: true, name: true, email: true } },
                    team: { select: { team_id: true, team_name: true } },
                },
                orderBy: { created_at: "desc" },
                take: 20,
            });

            return res.status(200).json({ data: comments });
        } catch (error) {
            console.error("Error fetching team comments:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

export default StudentTeamController;
