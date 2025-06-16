import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsFileExtensionConstraint implements ValidatorConstraintInterface {
  validate(fileName: string, args: ValidationArguments): boolean {
    const allowedExtensions: string[] = args.constraints;
    const fileExtension = fileName.split('.').pop();
    return allowedExtensions.includes(fileExtension ?? '');
  }

  defaultMessage(args: ValidationArguments): string {
    const allowedExtensions = args.constraints.join(', ');
    return `The file must have one of the following extensions: ${allowedExtensions}.`;
  }
}

export function IsFileExtension(
  extensions: string[],
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: extensions,
      validator: IsFileExtensionConstraint,
    });
  };
}
