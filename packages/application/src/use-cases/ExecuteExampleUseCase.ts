import { Result, ExampleAggregate } from '@inducore/core-domain';
import { ExampleCommandInputDTO, ExampleCommandOutputDTO } from '../dtos/ExampleCommandDTO.js';
import { IExampleRepository } from '../ports/IExampleRepository.js';

export class ExecuteExampleUseCase {
  constructor(private readonly exampleRepo: IExampleRepository) {}

  public async execute(input: ExampleCommandInputDTO): Promise<Result<ExampleCommandOutputDTO>> {
    const aggregateResult = ExampleAggregate.create({
      name: input.name,
      status: 'ACTIVE',
    });

    if (aggregateResult.isFailure) {
      return Result.fail<ExampleCommandOutputDTO>(aggregateResult.error!);
    }

    const aggregate = aggregateResult.getValue();
    await this.exampleRepo.save(aggregate, input.tenantId);

    return Result.ok<ExampleCommandOutputDTO>({
      id: aggregate.id,
      success: true,
    });
  }
}
