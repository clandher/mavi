
export class ApiRes<T> {
    data!: T[];
}


export class Category {
    id!: number;
    type!: string;
    students!: StudentCategory[];
    activities!: Activity[];
}


export class StudentCategory {
    id!: number;

    studentId!: Student;
    categoryId!: Category;
}


export class Student {
    id!: number;

    name!: string;

    age!: number;

    debt!: string;

    categories!: StudentCategory[];

    activities!: StudentActivity[];
}


export class StudentActivity {
    id!: number;

    studentId!: Student;

    activityId!: Activity;

    registrationDate!: Date;
}


export class Activity {
    id!: number;

    category!: Category;

    type!: ActivityType;

    description!: string;

    startDate!: Date;

    endDate!: Date;

    gracePeriod!: number;
}

export class ActivityType {
    id!: number;

    key!: string;

    recurrent!: boolean;

    recurrentDate!: boolean;
}
