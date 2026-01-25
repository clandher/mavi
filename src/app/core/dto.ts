export enum NotificationType {
    GENERAL = 1,
    CATEGORY = 2,
    ACTIVITY = 3,
    STUDENT = 4,
    INSCRIPTION = 5,
    AUTOMATIC_INSCRIPTION = 6,
    SURRCHARGE = 7,
    MANUAL_CHARGE = 8,
    UNSUBSCRIBE = 9,
    PAYMENT = 10,
    DISCOUNT = 11,
}

export enum UserRoleType {
    TUTOR,
    EMPLOYEE,
    STUDENT,
}

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
    curp!: string;
    phone!: string;
    placeOfBirth!: string;
    tutorId!: number;
    user?: User;
    userId?: number;


    debt!: number;
    photo!: string;
    photoUrl!: string;

    categories!: StudentCategory[];

    activities!: StudentActivity[];
    payments!: PaymentEntity[];

    notifications!: NotificationType[];
    wantsNotifications?: boolean;

    radars?: {
        [key: string]: {
            [key: string]: number
        };
    };
}


export class CreateStudentDto {
    name!: string;
    birthdate!: Date;
    curp?: string;
    phone?: string;
    placeOfBirth?: string;
    nick?: string;
    wantsNotifications?: boolean;
    tutorId?: number;
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
    debt!: number;

    inscriptionDate!: Date;
    debtActivityAmount!: number;

    charges: Charge[] = [];
    unsubscribedDate!: Date;
    unsubscribed!: boolean;
    surchargeApplied!: boolean;
}


export class Activity {
    id!: number;

    category!: Category;
    categoryId!: number;



    type!: ActivityType;
    typeId!: number;

    code!: string;
    description!: string;

    startDate!: string;

    endDate!: string;

    gracePeriod!: string;
    price!: number;
}

export class ActivityType {
    id!: number;
    key!: string;
    recurrent!: boolean;
    rule?: string;
    format?: string;
    surchargeAmount!: number;
    lock!: boolean;
}

export class DiscountType {
    id!: number;
    key!: string;
    description!: string;
    type!: 'percentage' | 'amount';
    value!: number;
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
    charges?: number[]
}

export interface CreateActivityDto {
    description: string;
    startDate: string; // formato 'YYYY-MM-DDTHH:mm'
    endDate: string;   // formato 'YYYY-MM-DDTHH:mm'
    gracePeriod: string;
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
    dueDate!: Date;
    amountRemaining!: number;
    amountDiscounted!: number;
    surchargeApplied!: boolean;
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
    originalObservation?: string;
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
    gracePeriod: string;
    price: number;
    typeId: number;
    type: ActivityType;
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

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    developer: boolean;
    lock: boolean;

    student?: Student;
    tutor?: Tutor;
    employee?: Employee;
    roles?: string[];
    studentId?: number;
    tutorId?: number;
    employeeId?: number;
}




export interface GateControlConfiguration {
    id: number;
    description: string;
    config: GateControlConfig;
    lock: boolean;
}

export interface GateControlConfig {
    servoPin?: number;
    servoMin?: number;
    servoMax?: number;
    servoDelay?: number;
    checkInterval?: number;
    pulseMin?: number;
    pulseMax?: number;
    initialAngle?: number;
    finalAngle?: number;
    repetitions?: number;
    repeatDelay?: number;
}

export interface Configuration {
    id: number;
    description: string;
    seeder: SeederConfig;
    lock: boolean;
}



export interface SeederConfig {
    activityType: {
        rule: string,
        format: string,
        surchargeAmount: number,
    },
    student: {
        seed: number,
        quantity: number,
    },
    activity: {
        duration: string,
        gracePeriod: string,
        price: {
            min: number,
            max: number,
        }
    },
    school: {
        name: string,
    }
}

export interface NotificationFact {
    id: number;
    type: number;
    categoryId?: number;
    category: Category;
    activityId?: number;
    activity?: Activity;
    studentId?: number;
    student?: Student;
    message: string;
    processed: boolean;
    count?: number;
    createdAt: string;
    sent?: number;
    failed?: number;
}


export interface NotificationRecipient {
    id: number;
    notificationId: number;
    notification?: NotificationFact;
    studentId?: number;
    student?: Student;
    status: number;
    sentAt?: string;
}

export interface Tutor {
    id: number;
    name: string;
    students: Student[]
    user?: User;
}
export interface Employee {
    id: number;
    name: string;
    user?: User;
}
