
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


export class CreateChargeDto {
    studentActivityId!: number;
    amountToBePaid!: number;
    concept!: string;
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
    typeId!: number;

    description!: string;
    details!: string;

    startDate!: string;

    endDate!: string;

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
    startDate: string; // formato 'YYYY-MM-DDTHH:mm'
    endDate: string;   // formato 'YYYY-MM-DDTHH:mm'
    gracePeriod: number;
    price: number;
    categoryId: number;
    typeId: number; // Asumo que también necesitas el tipo de actividad
}

export class Charge {
    id!: number;
    studentActivity!: StudentActivity;
    student!: Student;
    concept!: string;
    studentId!: number;
    chargeDate!: Date;
    amountToBePaid!: number;
    amountRemaining!: number;
    surcharge!: boolean;
    activityId!: number;
    activity!: Activity;
}
export class CreateSchoolDto {
    description!: string;
}

export class School {
    id!: number;
    description!: string;
    logo?: string;
    logoUrl?: string;
}

export class StudentObservation {
    id!: number;
    studentId!: number
    observation!: string;
    activity!: Activity
    createdAt!: string;
    activityId!: number;
    student!: Student;
}

export interface Activity {
    id: number;
    categoryId: number;
    category: Category;
    description: string;
    startDate: string;
    endDate: string;
    gracePeriod: number;
    price: number;
}

export interface Collection {
    id: number;
    studentId: number;
    chargeDate: string;
    amountToBePaid: number;
    amountRemaining: number;
    activityId: number;
    concept: string;
}

export interface PaymentCharge {
    id: number;
    amount: number;
    amountRemained: number;
    activityId: number;
    collection: Collection;
    activity: Activity;
}

export interface StudentPayment {
    id: number;
    studentId: number;
    amount: number;
    paymentDate: string;
    voucher: string;
    student: Student;
    paymentCharges: PaymentCharge[];
}