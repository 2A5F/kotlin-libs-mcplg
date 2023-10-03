import * as core from 'npm:@actions/core@1.10'
import { ModrinthVersion, Project, Versions } from './types.ts'
import { fetchJson } from './net.ts'

const modrinth_token = Deno.env.get('MODRINTH_TOKEN')!
const github_repository = Deno.env.get('GITHUB_REPOSITORY')!

const versions_path = './versions.json'
const projects_path = './projects.json'

const versions: Versions = JSON.parse(await Deno.readTextFile(versions_path))
const projects: Project[] = JSON.parse(await Deno.readTextFile(projects_path))

await Promise.all(projects.map(diff))

const new_versions: Versions = {}

core.setOutput('vers', new_versions)
core.info(JSON.stringify(new_versions, null, 2))

async function diff(proj: Project) {
    const vers = await fetchJson<ModrinthVersion[]>(`https://api.modrinth.com/v2/project/${proj.modrinth.id}/version`, {
        headers: {
            Authorization: modrinth_token,
            'User-Agent': github_repository,
        },
    })
    core.info(JSON.stringify(vers, null, 2))

    const proj_vers = versions[proj.name]
    const exists_vers = new Set(vers.map((a) => a.version_number))
    const new_vers = proj_vers.filter((a) => !exists_vers.has(a))
    new_versions[proj.name] = new_vers
}
