import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { AuthResponseType } from "../types/AuthResponse";
import { CreateUserDTO } from "../DTOs/CreateUserDTO";
import { UpdateUserDTO } from "../DTOs/UpdateUserDTO";
import { AuditLogDTO } from "../DTOs/AuditLogDTO";
import { CreateAuditLogDTO } from "../DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../DTOs/UpdateAuditLogDTO";
import { PlantDTO } from "../DTOs/PlantDTO";
import { CreatePlantDTO } from "../DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../DTOs/UpdatePlantDTO";
import { SeedPlantDTO } from "../DTOs/SeedPlantDTO";
import { AdjustStrengthDTO } from "../DTOs/AdjustStrengthDTO";
import { HarvestPlantsDTO } from "../DTOs/HarvestPlantsDTO";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { CreatePerfumeDTO } from "../DTOs/CreatePerfumeDTO";
import { UpdatePerfumeDTO } from "../DTOs/UpdatePerfumeDTO";
import { PackagingDTO } from "../DTOs/PackagingDTO";
import { CreatePackagingDTO } from "../DTOs/CreatePackagingDTO";
import { UpdatePackagingDTO } from "../DTOs/UpdatePackagingDTO";
import { WarehouseDTO } from "../DTOs/WarehouseDTO";
import { CreateWarehouseDTO } from "../DTOs/CreateWarehouseDTO";
import { UpdateWarehouseDTO } from "../DTOs/UpdateWarehouseDTO";
import { SaleDTO } from "../DTOs/SaleDTO";
import { CreateSaleDTO } from "../DTOs/CreateSaleDTO";
import { UpdateSaleDTO } from "../DTOs/UpdateSaleDTO";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;
  logout(token: string): Promise<{ success: boolean; message: string }>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;
  createUser(data: CreateUserDTO): Promise<UserDTO>;
  updateUser(id: number, data: UpdateUserDTO): Promise<UserDTO>;
  deleteUser(id: number): Promise<void>;
  searchUsers(query: string): Promise<UserDTO[]>;

  // Audit logs
  getAllLogs(token: string): Promise<AuditLogDTO[]>;
  getLogById(token: string, id: number): Promise<AuditLogDTO>;
  createLog(token: string, data: CreateAuditLogDTO): Promise<AuditLogDTO>;
  updateLog(token: string, id: number, data: UpdateAuditLogDTO): Promise<AuditLogDTO>;
  deleteLog(token: string, id: number): Promise<void>;
  searchLogs(token: string, query: string): Promise<AuditLogDTO[]>;

  // Plants
  getAllPlants(token: string): Promise<PlantDTO[]>;
  getPlantById(token: string, id: number): Promise<PlantDTO>;
  searchPlants(token: string, query: string): Promise<PlantDTO[]>;
  createPlant(token: string, data: CreatePlantDTO): Promise<PlantDTO>;
  updatePlant(token: string, id: number, data: UpdatePlantDTO): Promise<PlantDTO>;
  deletePlant(token: string, id: number): Promise<void>;
  seedPlant(token: string, data: SeedPlantDTO): Promise<PlantDTO>;
  adjustPlantStrength(token: string, data: AdjustStrengthDTO): Promise<PlantDTO>;
  harvestPlants(token: string, data: HarvestPlantsDTO): Promise<PlantDTO[]>;

  // Perfumes
  getAllPerfumes(token: string): Promise<PerfumeDTO[]>;
  getPerfumeById(token: string, id: number): Promise<PerfumeDTO>;
  searchPerfumes(token: string, query: string): Promise<PerfumeDTO[]>;
  createPerfume(token: string, data: CreatePerfumeDTO): Promise<PerfumeDTO>;
  updatePerfume(token: string, id: number, data: UpdatePerfumeDTO): Promise<PerfumeDTO>;
  deletePerfume(token: string, id: number): Promise<void>;
  startProcessing(
    token: string,
    data: {
      perfumeName: string;
      perfumeType: string;
      bottleVolumeMl: number;
      bottleCount: number;
      plantId: number;
      expirationDate: string;
      serialPrefix?: string;
    }
  ): Promise<PerfumeDTO[]>;

  // Packaging
  getAllPackaging(token: string): Promise<PackagingDTO[]>;
  getPackagingById(token: string, id: number): Promise<PackagingDTO>;
  searchPackaging(token: string, query: string): Promise<PackagingDTO[]>;
  createPackaging(token: string, data: CreatePackagingDTO): Promise<PackagingDTO>;
  updatePackaging(token: string, id: number, data: UpdatePackagingDTO): Promise<PackagingDTO>;
  deletePackaging(token: string, id: number): Promise<void>;

  // Warehouses
  getAllWarehouses(token: string): Promise<WarehouseDTO[]>;
  getWarehouseById(token: string, id: number): Promise<WarehouseDTO>;
  searchWarehouses(token: string, query: string): Promise<WarehouseDTO[]>;
  createWarehouse(token: string, data: CreateWarehouseDTO): Promise<WarehouseDTO>;
  updateWarehouse(token: string, id: number, data: UpdateWarehouseDTO): Promise<WarehouseDTO>;
  deleteWarehouse(token: string, id: number): Promise<void>;

  // Sales
  getAllSales(token: string): Promise<SaleDTO[]>;
  getSaleById(token: string, id: number): Promise<SaleDTO>;
  searchSales(token: string, query: string): Promise<SaleDTO[]>;
  createSale(token: string, data: CreateSaleDTO): Promise<SaleDTO>;
  updateSale(token: string, id: number, data: UpdateSaleDTO): Promise<SaleDTO>;
  deleteSale(token: string, id: number): Promise<void>;
}

