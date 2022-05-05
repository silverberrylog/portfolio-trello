import { Task } from '@/types'

export const filterTasks = (tasks: Task[], query: string) => {
    return tasks.filter(
        task => task.name.includes(query) || task.id == 'temp_task'
    )
}
