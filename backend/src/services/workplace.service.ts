import prisma from "../config/prisma";

interface CreateWorkplaceData {
  organizationId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maximumSessionHours: number;
}

export async function createWorkplace(
  data: CreateWorkplaceData
) {
  const name = data.name.trim();

  if (!name) {
    throw new Error("Workplace name is required");
  }

  if (
    data.latitude < -90 ||
    data.latitude > 90
  ) {
    throw new Error("Invalid latitude");
  }

  if (
    data.longitude < -180 ||
    data.longitude > 180
  ) {
    throw new Error("Invalid longitude");
  }

  if (data.radiusMeters <= 0) {
    throw new Error(
      "Radius must be greater than zero"
    );
  }

  if (data.maximumSessionHours <= 0) {
    throw new Error(
      "Maximum session hours must be greater than zero"
    );
  }

  const existingActiveWorkplace =
    await prisma.workplace.findFirst({
      where: {
        organizationId: data.organizationId,
        isActive: true,
      },
    });

  if (existingActiveWorkplace) {
    throw new Error(
      "An active workplace already exists"
    );
  }

  const workplace = await prisma.workplace.create({
    data: {
      organizationId: data.organizationId,
      name,
      latitude: data.latitude,
      longitude: data.longitude,
      radiusMeters: data.radiusMeters,
      maximumSessionHours:
        data.maximumSessionHours,
      isActive: true,
    },
  });

  return workplace;
}

export async function getWorkplace(
  organizationId: string
) {
  const workplace = await prisma.workplace.findFirst({
    where: {
      organizationId,
      isActive: true,
    },

    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      radiusMeters: true,
      maximumSessionHours: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!workplace) {
    throw new Error("No active workplace configured");
  }

  return workplace;
}

interface UpdateWorkplaceData {
  organizationId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maximumSessionHours: number;
}

export async function updateWorkplace(
  data: UpdateWorkplaceData
) {
  const name = data.name.trim();

  if (!name) {
    throw new Error("Workplace name is required");
  }

  if (
    data.latitude < -90 ||
    data.latitude > 90
  ) {
    throw new Error("Invalid latitude");
  }

  if (
    data.longitude < -180 ||
    data.longitude > 180
  ) {
    throw new Error("Invalid longitude");
  }

  if (data.radiusMeters <= 0) {
    throw new Error(
      "Radius must be greater than zero"
    );
  }

  if (data.maximumSessionHours <= 0) {
    throw new Error(
      "Maximum session hours must be greater than zero"
    );
  }

  const workplace = await prisma.workplace.findFirst({
    where: {
      organizationId: data.organizationId,
      isActive: true,
    },
  });

  if (!workplace) {
    throw new Error("No active workplace configured");
  }

  const updatedWorkplace =
    await prisma.workplace.update({
      where: {
        id: workplace.id,
      },

      data: {
        name,
        latitude: data.latitude,
        longitude: data.longitude,
        radiusMeters: data.radiusMeters,
        maximumSessionHours:
          data.maximumSessionHours,
      },
    });

  return updatedWorkplace;
}