FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY PlaceGuide.Server/PlaceGuide.Server.csproj PlaceGuide.Server/
RUN dotnet restore PlaceGuide.Server/PlaceGuide.Server.csproj -p:BuildFrontend=false

COPY PlaceGuide.Server/ PlaceGuide.Server/
RUN dotnet publish PlaceGuide.Server/PlaceGuide.Server.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore \
    -p:BuildFrontend=false \
    -p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "dotnet PlaceGuide.Server.dll --urls http://0.0.0.0:${PORT:-10000}"]
