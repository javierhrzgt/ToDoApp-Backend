export interface CreateTaskInput{
    title: string;
    description?: string;
}

export interface UpdateTaskInput{
    title?: string;
    description?: string;
    completed?: boolean;
}

export interface TaskResponse{
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

