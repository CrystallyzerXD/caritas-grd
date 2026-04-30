package com.caritas.grd.config;

import com.caritas.grd.model.*;
import com.caritas.grd.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventTypeRepository eventTypeRepository;
    private final DistrictRepository districtRepository;
    private final ParishRepository parishRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedEventTypes();
        seedDistricts();
        seedAdminUser();
        log.info("Data seeding completed.");
    }

    private void seedEventTypes() {
        if (eventTypeRepository.count() == 0) {
            List<EventType> types = List.of(
                EventType.builder().name("Incendio").code("FIRE").active(true).build(),
                EventType.builder().name("Inundación").code("FLOOD").active(true).build(),
                EventType.builder().name("Deslizamiento").code("LANDSLIDE").active(true).build(),
                EventType.builder().name("Tsunami").code("TSUNAMI").active(true).build(),
                EventType.builder().name("Colapso de Infraestructura").code("INFRASTRUCTURE_COLLAPSE").active(true).build(),
                EventType.builder().name("Pérdida Parcial de Vivienda").code("PARTIAL_HOUSING_LOSS").active(true).build(),
                EventType.builder().name("Sismo").code("EARTHQUAKE").active(true).build(),
                EventType.builder().name("Huayco").code("MUDSLIDE").active(true).build()
            );
            eventTypeRepository.saveAll(types);
            log.info("Event types seeded: {} records", types.size());
        }
    }

    private void seedDistricts() {
        if (districtRepository.count() == 0) {
            List<District> districts = List.of(
                District.builder().name("Miraflores").province("Lima").active(true).build(),
                District.builder().name("San Isidro").province("Lima").active(true).build(),
                District.builder().name("Barranco").province("Lima").active(true).build(),
                District.builder().name("Surco").province("Lima").active(true).build(),
                District.builder().name("La Molina").province("Lima").active(true).build(),
                District.builder().name("San Borja").province("Lima").active(true).build(),
                District.builder().name("Chorrillos").province("Lima").active(true).build(),
                District.builder().name("Villa María del Triunfo").province("Lima").active(true).build(),
                District.builder().name("Villa El Salvador").province("Lima").active(true).build(),
                District.builder().name("San Juan de Miraflores").province("Lima").active(true).build(),
                District.builder().name("Ate").province("Lima").active(true).build(),
                District.builder().name("Santa Anita").province("Lima").active(true).build(),
                District.builder().name("El Agustino").province("Lima").active(true).build(),
                District.builder().name("San Luis").province("Lima").active(true).build(),
                District.builder().name("La Victoria").province("Lima").active(true).build(),
                District.builder().name("Lince").province("Lima").active(true).build(),
                District.builder().name("Jesús María").province("Lima").active(true).build(),
                District.builder().name("Magdalena del Mar").province("Lima").active(true).build(),
                District.builder().name("Pueblo Libre").province("Lima").active(true).build(),
                District.builder().name("Breña").province("Lima").active(true).build(),
                District.builder().name("Rímac").province("Lima").active(true).build(),
                District.builder().name("San Martín de Porres").province("Lima").active(true).build(),
                District.builder().name("Los Olivos").province("Lima").active(true).build(),
                District.builder().name("Independencia").province("Lima").active(true).build(),
                District.builder().name("Comas").province("Lima").active(true).build(),
                District.builder().name("Carabayllo").province("Lima").active(true).build(),
                District.builder().name("Puente Piedra").province("Lima").active(true).build(),
                District.builder().name("San Juan de Lurigancho").province("Lima").active(true).build(),
                District.builder().name("Lurigancho").province("Lima").active(true).build(),
                District.builder().name("Pachacámac").province("Lima").active(true).build(),
                District.builder().name("Lurín").province("Lima").active(true).build(),
                District.builder().name("Punta Hermosa").province("Lima").active(true).build(),
                District.builder().name("Punta Negra").province("Lima").active(true).build(),
                District.builder().name("San Bartolo").province("Lima").active(true).build(),
                District.builder().name("Santa María del Mar").province("Lima").active(true).build(),
                District.builder().name("Pucusana").province("Lima").active(true).build(),
                District.builder().name("Cercado de Lima").province("Lima").active(true).build()
            );
            List<District> saved = districtRepository.saveAll(districts);
            log.info("Districts seeded: {} records", saved.size());

            // Seed some parishes
            if (parishRepository.count() == 0) {
                District cercado = saved.stream()
                        .filter(d -> d.getName().equals("Cercado de Lima"))
                        .findFirst().orElse(saved.get(0));

                List<Parish> parishes = List.of(
                    Parish.builder().name("Parroquia San Pedro").district(cercado).active(true).build(),
                    Parish.builder().name("Parroquia La Merced").district(cercado).active(true).build(),
                    Parish.builder().name("Parroquia Santo Domingo").district(cercado).active(true).build()
                );
                parishRepository.saveAll(parishes);
                log.info("Parishes seeded");
            }
        }
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail("admin@caritas.pe")) {
            User admin = User.builder()
                    .fullName("Administrador Cáritas")
                    .email("admin@caritas.pe")
                    .password(passwordEncoder.encode("Admin123!"))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created: admin@caritas.pe");
        }

        if (!userRepository.existsByEmail("especialista@caritas.pe")) {
            User specialist = User.builder()
                    .fullName("Juan Pérez Especialista")
                    .email("especialista@caritas.pe")
                    .password(passwordEncoder.encode("Spec123!"))
                    .role(Role.GRD_SPECIALIST)
                    .active(true)
                    .build();
            userRepository.save(specialist);
            log.info("GRD Specialist user created: especialista@caritas.pe");
        }

        if (!userRepository.existsByEmail("prueba@caritas.org.pe")) {
            User prueba = User.builder()
                    .fullName("Usuario Prueba")
                    .email("prueba@caritas.org.pe")
                    .password(passwordEncoder.encode("prueba123"))
                    .role(Role.GRD_SPECIALIST)
                    .active(true)
                    .build();
            userRepository.save(prueba);
            log.info("Test user created: prueba@caritas.org.pe");
        }
    }
}
