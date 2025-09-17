import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'

@ValidatorConstraint({ async: false })
export class ConditionalStockConstraint implements ValidatorConstraintInterface {
  validate(stock: any, args: ValidationArguments) {
    const object = args.object as any
    const hasVariants = object.hasVariants

    // Nếu sản phẩm có biến thể (hasVariants = true), thì stock không bắt buộc
    if (hasVariants === true) {
      return true // Cho phép stock là undefined, null, hoặc bất kỳ giá trị nào
    }

    // Nếu sản phẩm không có biến thể (hasVariants = false), thì stock phải là số >= 0
    if (hasVariants === false) {
      return typeof stock === 'number' && stock >= 0
    }

    // Nếu hasVariants chưa được định nghĩa, cho phép
    return true
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as any
    const hasVariants = object.hasVariants

    if (hasVariants === false) {
      return 'Stock phải là số và không được nhỏ hơn 0 khi sản phẩm không có biến thể'
    }

    return 'Stock không hợp lệ'
  }
}

export function ConditionalStock(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ConditionalStockConstraint,
    })
  }
}