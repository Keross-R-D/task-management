<<<<<<< HEAD
package com.ikon.taskmanagement.config;
=======
package com.ikon.projectmanagement.config;
>>>>>>> 0b3935e1abdb895be2b79f8984a06a1f0eaa3367

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

	@Bean
	ModelMapper modelMapper() {
		return new ModelMapper();
	}

}
