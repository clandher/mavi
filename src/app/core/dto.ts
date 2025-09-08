
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
    category!: Category;
    categoryId!: number;
}


export class Student {
    id!: number;

    name!: string;
    nick!: string;

    birthdate!: string;

    debt!: number;
    photo!: string;
    photoUrl!: string;

    categories!: StudentCategory[];

    activities!: StudentActivity[];
    payments!: PaymentEntity[];
}


export class CreateStudentDto {
    name!: string;
    birthdate!: Date;
}

export class UpdateStudentDto extends CreateStudentDto {
}



export class StudentActivity {
    id!: number;

    public student!: Student;
    studentId!: number;

    activity!: Activity;
    activityId!: number;
    price!: number;

    inscriptionDate!: Date;
    debtActivityAmount!: number;
    
    charges: Charge[] = [];
    unsubscribedDate!: Date;
    unsubscribed!: boolean;
}


export class Activity {
    id!: number;

    category!: Category;
    categoryId!: number;

    type!: ActivityType;

    description!: string;
    details!: string;

    startDate!: Date;

    endDate!: Date;

    gracePeriod!: number;
    price!: number;
}

export class ActivityType {
    id!: number;

    key!: string;

    recurrent!: boolean;

    recurrentDate!: boolean;
}


export class PaymentEntity {
    id?: number;

    student!: Student;

    amount!: number;

    paymentDate!: Date;

    voucher!: string; // Suponiendo que es un archivo o URL
}


export class CreatePaymentDto {
    studentId!: number;
    amount!: number;
}

export interface CreateActivityDto {
    description: string;
    startDate: Date;
    endDate: Date;
    gracePeriod: number;
    price: number;
    categoryId: number;
    typeId: number; // Asumo que también necesitas el tipo de actividad
}

export class Charge {
    id!: number;
    studentActivity!: StudentActivity;
    student!: Student;
    studentId!: number;
    chargeDate!: Date;
    amountToBePaid!: number;
    amountRemaining!: number;
    surcharge!: boolean;
    activityId!: number;
    activity!: Activity;
}
