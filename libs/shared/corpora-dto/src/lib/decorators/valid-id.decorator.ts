import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsLowercaseWithoutSpacesOrSpecialCharsConstraint
  implements ValidatorConstraintInterface
{
  validate(text: string): boolean {
    const lowercaseCheck = text === text.toLowerCase();
    const noSpacesCheck = !/\s/.test(text);
    const noSpecialCharsCheck = /^[a-z0-9]+$/.test(text);

    return lowercaseCheck && noSpacesCheck && noSpecialCharsCheck;
  }

  defaultMessage(): string {
    return 'The text must be all lowercase, without spaces, and without special characters.';
  }
}

export function IsLowercaseWithoutSpacesOrSpecialChars(
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLowercaseWithoutSpacesOrSpecialCharsConstraint,
    });
  };
}
