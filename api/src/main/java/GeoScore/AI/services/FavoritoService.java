package GeoScore.AI.services;

import GeoScore.AI.entities.FavoritoEntity;
import GeoScore.AI.repositories.FavoritoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoritoService {
    private final FavoritoRepository favoritoRepository;

    public FavoritoService(FavoritoRepository favoritoRepository) {
        this.favoritoRepository = favoritoRepository;
    }

    public List<String> getFavoritosIds(String userId) {
        return favoritoRepository.findByUserId(userId)
                .stream()
                .map(FavoritoEntity::getInmuebleId)
                .collect(Collectors.toList());
    }

    @Transactional
    public String toggleFavorito(String userId, String inmuebleId) {
        Optional<FavoritoEntity> existente = favoritoRepository.findByUserIdAndInmuebleId(userId, inmuebleId);

        if (existente.isPresent()) {
            favoritoRepository.deleteByUserIdAndInmuebleId(userId, inmuebleId);
            return "eliminado"; // CU-11: A2 Toggle (Ya existía, se elimina)
        } else {
            FavoritoEntity nuevo = new FavoritoEntity();
            nuevo.setUserId(userId);
            nuevo.setInmuebleId(inmuebleId);
            favoritoRepository.save(nuevo);
            return "agregado"; // CU-11: Camino Normal (Se agrega)
        }
    }
}