package com.medicare.appvisitas.config;

import com.medicare.appvisitas.domain.model.CentroMedico;
import com.medicare.appvisitas.domain.model.EstadoMedico;
import com.medicare.appvisitas.domain.model.Zona;
import com.medicare.appvisitas.domain.repository.CentroMedicoRepository;
import com.medicare.appvisitas.domain.repository.ZonaRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@org.springframework.context.annotation.Profile("!test")
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initData(
            ZonaRepository zonaRepo,
            CentroMedicoRepository centroRepo
    ) {
        return args -> {
            // 1. Zonas geográficas base
            if (zonaRepo.count() == 0) {
                log.info("Inicializando catálogo base de zonas geográficas...");
                zonaRepo.saveAll(List.of(
                        new Zona("Zona Metropolitana", "Distrito Nacional y Gran Santo Domingo", true),
                        new Zona("Zona Norte (Cibao)", "Santiago, La Vega, San Francisco y Puerto Plata", true),
                        new Zona("Zona Este", "San Pedro, La Romana, Higüey y Punta Cana", true),
                        new Zona("Zona Sur", "San Cristóbal, Baní, Azua y Barahona", true)
                ));
            }

            // 2. Catálogo base de Centros Médicos compartidos
            if (centroRepo.count() == 0) {
                log.info("Inicializando catálogo base de centros médicos...");
                CentroMedico cm1 = new CentroMedico("Centro Médico Abel González", "Av. Abraham Lincoln 953, Piantini", "(809) 227-2235", "Santo Domingo", EstadoMedico.ACTIVO);
                CentroMedico cm2 = new CentroMedico("Clínica Corazones Unidos", "Calle Fantino Falco 21, Naco", "(809) 567-4421", "Santo Domingo", EstadoMedico.ACTIVO);
                CentroMedico cm3 = new CentroMedico("CEDIMAT", "Calle Pepillo Salcedo, Plaza de la Salud", "(809) 565-9989", "Santo Domingo", EstadoMedico.ACTIVO);
                CentroMedico cm4 = new CentroMedico("Hospital Metropolitano de Santiago (HOMS)", "Autopista Duarte Km 2.8", "(829) 947-2222", "Santiago", EstadoMedico.ACTIVO);
                CentroMedico cm5 = new CentroMedico("Centro Médico Punta Cana", "Av. España 22, Bávaro", "(809) 552-1506", "Punta Cana", EstadoMedico.ACTIVO);
                centroRepo.saveAll(List.of(cm1, cm2, cm3, cm4, cm5));
            }

            log.info("Catálogos base inicializados. El primer usuario en registrarse será el Administrador de la empresa.");
        };
    }
}
