import { defineStore } from "pinia";
import type { ContainerResponse, ContainerWithProductsResponse } from "@sudosos/sudosos-client";
import ApiService from "@/services/ApiService";
import apiService from "@/services/ApiService";
import { fetchAllPages } from "@sudosos/sudosos-frontend-common";

interface ContainerStore {
    containerMap: {[key:number]: ContainerWithProductsResponse}
    baseContainers: ContainerResponse[]
}
export const useContainerStore = defineStore('container', {
    state: () => ({
        containerMap: {},
        baseContainers: [],
    } as ContainerStore),
    getters: {
        getPublicContainer(): ContainerResponse[] {
            return this.baseContainers.filter((c) => c.public);
        },
    },
    actions: {
        async fetchAllContainers() {
            this.baseContainers = await fetchAllPages<ContainerResponse>(
              0,
              Number.MAX_SAFE_INTEGER,
              // @ts-ignore
              (take, skip) => apiService.container.getAllContainers(take, skip)
            );
        },
        async fetchContainer(id: number): Promise<ContainerWithProductsResponse> {
            if (id in this.containerMap) return this.containerMap[id];

            const resp = await ApiService.container.getSingleContainer(id);
            this.containerMap[id] = resp.data;
            return this.containerMap[id];
        },
        async getPublicContainers(){
            const response = await ApiService.container.getPublicContainers();
            return response.data;
        },
        async getUsersContainers(id: number) {
            const response = await ApiService.user.getUsersContainers(id);
            return response.data;
        },
        async createEmptyContainer(name: string, isPublic: boolean, ownerId: number){
            return await ApiService.container.createContainer(
                { name: name, products: [], public: isPublic, ownerId: ownerId });

        }
    }
});
