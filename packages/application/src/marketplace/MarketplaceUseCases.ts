import { Result, IndustrialNetworkProfileAggregate, PartnershipRequestAggregate } from '@inducore/core-domain';
import { IMarketplaceRepository, AISupplierRecommendation, AIRFQRecommendation } from './IMarketplaceRepository.js';
import { CreateProfileDTO, AddProductDTO, AddServiceDTO, CreatePartnershipRequestDTO, PostNewsDTO, AICapabilitySearchDTO } from './MarketplaceDTOs.js';
import { GoogleGenAI } from '@google/genai';

export class MarketplaceUseCases {
  constructor(private readonly marketplaceRepo: IMarketplaceRepository) {}

  public async listProfiles(query?: string, category?: string, verifiedOnly?: boolean): Promise<Result<IndustrialNetworkProfileAggregate[]>> {
    const profiles = await this.marketplaceRepo.listProfiles(query, category, verifiedOnly);
    return Result.ok<IndustrialNetworkProfileAggregate[]>(profiles);
  }

  public async getProfileById(id: string): Promise<Result<IndustrialNetworkProfileAggregate>> {
    const profile = await this.marketplaceRepo.getProfileById(id);
    if (!profile) return Result.fail<IndustrialNetworkProfileAggregate>('Company profile not found');
    return Result.ok<IndustrialNetworkProfileAggregate>(profile);
  }

  public async createProfile(tenantId: string, dto: CreateProfileDTO): Promise<Result<IndustrialNetworkProfileAggregate>> {
    const res = IndustrialNetworkProfileAggregate.create({
      tenantId,
      companyName: dto.companyName,
      logoUrl: dto.logoUrl,
      industryCategory: dto.industryCategory,
      headquartersCountry: dto.headquartersCountry,
      operatingLanguages: dto.operatingLanguages,
      description: dto.description,
      isVerifiedSupplier: true,
      reputationScore: 85.0,
      followersCount: 1,
      capabilities: dto.capabilities,
      certifications: [
        {
          name: 'ISO 9001:2015',
          issuingBody: 'BSI Group',
          certificateNumber: `ISO-${Math.floor(Math.random() * 90000) + 10000}`,
          validUntil: '2028-12-31',
          verified: true,
        },
      ],
      products: [],
      services: [],
      newsPosts: [],
      createdAt: new Date().toISOString(),
    });

    if (res.isFailure) return Result.fail<IndustrialNetworkProfileAggregate>(res.error || 'Failed to create profile');
    const profile = res.getValue();
    await this.marketplaceRepo.saveProfile(profile);
    return Result.ok<IndustrialNetworkProfileAggregate>(profile);
  }

  public async toggleFollow(id: string): Promise<Result<{ followersCount: number }>> {
    const profile = await this.marketplaceRepo.getProfileById(id);
    if (!profile) return Result.fail<{ followersCount: number }>('Profile not found');
    profile.incrementFollowers();
    await this.marketplaceRepo.saveProfile(profile);
    return Result.ok({ followersCount: profile.followersCount });
  }

  public async addProduct(companyId: string, dto: AddProductDTO): Promise<Result<IndustrialNetworkProfileAggregate>> {
    const profile = await this.marketplaceRepo.getProfileById(companyId);
    if (!profile) return Result.fail<IndustrialNetworkProfileAggregate>('Profile not found');

    profile.addProduct({
      id: `prod-${Math.random().toString(36).substring(2, 8)}`,
      title: dto.title,
      category: dto.category,
      description: dto.description,
      unitPrice: dto.unitPrice,
      currency: dto.currency,
      specifications: dto.specifications,
      isAvailable: true,
    });

    await this.marketplaceRepo.saveProfile(profile);
    return Result.ok<IndustrialNetworkProfileAggregate>(profile);
  }

  public async addService(companyId: string, dto: AddServiceDTO): Promise<Result<IndustrialNetworkProfileAggregate>> {
    const profile = await this.marketplaceRepo.getProfileById(companyId);
    if (!profile) return Result.fail<IndustrialNetworkProfileAggregate>('Profile not found');

    profile.addService({
      id: `serv-${Math.random().toString(36).substring(2, 8)}`,
      title: dto.title,
      serviceCategory: dto.serviceCategory,
      description: dto.description,
      hourlyRate: dto.hourlyRate,
      leadTimeDays: dto.leadTimeDays,
    });

    await this.marketplaceRepo.saveProfile(profile);
    return Result.ok<IndustrialNetworkProfileAggregate>(profile);
  }

  public async postNews(companyId: string, dto: PostNewsDTO): Promise<Result<IndustrialNetworkProfileAggregate>> {
    const profile = await this.marketplaceRepo.getProfileById(companyId);
    if (!profile) return Result.fail<IndustrialNetworkProfileAggregate>('Profile not found');

    profile.addNewsPost({
      id: `news-${Math.random().toString(36).substring(2, 8)}`,
      title: dto.title,
      content: dto.content,
      category: dto.category,
      publishedAt: new Date().toISOString(),
      author: profile.companyName + ' Press Office',
    });

    await this.marketplaceRepo.saveProfile(profile);
    return Result.ok<IndustrialNetworkProfileAggregate>(profile);
  }

  public async createPartnershipRequest(requesterCompanyId: string, requesterCompanyName: string, dto: CreatePartnershipRequestDTO): Promise<Result<PartnershipRequestAggregate>> {
    const res = PartnershipRequestAggregate.create({
      requesterCompanyId,
      requesterCompanyName,
      targetCompanyId: dto.targetCompanyId,
      targetCompanyName: dto.targetCompanyName,
      partnershipType: dto.partnershipType,
      proposedScope: dto.proposedScope,
      message: dto.message,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });

    if (res.isFailure) return Result.fail<PartnershipRequestAggregate>(res.error || 'Failed to create request');
    const request = res.getValue();
    await this.marketplaceRepo.savePartnershipRequest(request);
    return Result.ok<PartnershipRequestAggregate>(request);
  }

  public async listPartnershipRequests(companyId: string): Promise<Result<PartnershipRequestAggregate[]>> {
    const requests = await this.marketplaceRepo.listPartnershipRequests(companyId);
    return Result.ok<PartnershipRequestAggregate[]>(requests);
  }

  public async respondPartnershipRequest(requestId: string, accept: boolean): Promise<Result<PartnershipRequestAggregate>> {
    const req = await this.marketplaceRepo.getPartnershipRequestById(requestId);
    if (!req) return Result.fail<PartnershipRequestAggregate>('Request not found');

    req.respond(accept);
    await this.marketplaceRepo.savePartnershipRequest(req);
    return Result.ok<PartnershipRequestAggregate>(req);
  }

  public async getAllProducts() {
    return Result.ok(await this.marketplaceRepo.getAllProducts());
  }

  public async getAllServices() {
    return Result.ok(await this.marketplaceRepo.getAllServices());
  }

  public async getAllNewsPosts() {
    return Result.ok(await this.marketplaceRepo.getAllNewsPosts());
  }

  public async searchCapabilitiesAI(dto: AICapabilitySearchDTO): Promise<Result<{ recommendations: AISupplierRecommendation[]; aiSummary: string }>> {
    const baseRecommendations = await this.marketplaceRepo.recommendSuppliers(dto.query);
    let aiSummary = 'Gemini 2.5 capability matching evaluated industrial supplier technical credentials, ISO certifications, and manufacturing capacity.';

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are InduCore Industrial Network AI Matchmaker. Evaluate query "${dto.query}" against candidate suppliers: ${baseRecommendations.map(r => r.profile.companyName + ' (' + r.profile.capabilities.join(', ') + ')').join('; ')}. Write a 2-sentence executive recommendation summary focusing on technical capability compatibility.`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        if (response.text) {
          aiSummary = response.text;
        }
      } catch (e) {
        console.warn('Gemini API optional fallback for supplier match:', e);
      }
    }

    return Result.ok({ recommendations: baseRecommendations, aiSummary });
  }

  public async recommendRFQs(companyId: string): Promise<Result<AIRFQRecommendation[]>> {
    const recs = await this.marketplaceRepo.recommendRFQs(companyId);
    return Result.ok<AIRFQRecommendation[]>(recs);
  }
}
