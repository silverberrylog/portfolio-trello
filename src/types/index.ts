export type Color = 'blue' | 'brown' | 'green' | 'purple' | 'red' | 'yellow'

export interface HasId {
    id: string
}

export interface ProjectData {
    workspace: string
    name: string
    color: Color
}

export interface Project extends ProjectData, HasId {}

export interface Projects {
    [workspaceId: string]: Project[]
}

export interface WorkspaceData {
    name: string
}

export interface Workspace extends WorkspaceData, HasId {}

export interface ListData {
    project: string
    name: string
    createdAt: Date
}

export interface List extends ListData, HasId {}
